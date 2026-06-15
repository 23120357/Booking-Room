const db = require('../../config/db');
const AppError = require('../../utils/AppError');
const roomRepository = require('../../repositories/roomRepository');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

function validatePayload(payload) {
	const required = ['title', 'room_type', 'detailed_address', 'max_capacity', 'monthly_rent', 'deposit_amount'];
	for (const f of required) {
		if (payload[f] === undefined || payload[f] === null || payload[f] === '') {
			throw new AppError('VALIDATION_ERROR', `${f} is required`, 400);
		}
	}

	if (Number(payload.monthly_rent) <= 0) throw new AppError('VALIDATION_ERROR', 'monthly_rent must be > 0', 400);
	if (Number(payload.deposit_amount) < 0) throw new AppError('VALIDATION_ERROR', 'deposit_amount must be >= 0', 400);
	if (Number(payload.max_capacity) <= 0) throw new AppError('VALIDATION_ERROR', 'max_capacity must be > 0', 400);
}

async function createRoom(landlordId, payload, files = []) {
	validatePayload(payload);

	if (!files || files.length < 3) {
		throw new AppError('VALIDATION_ERROR', 'At least 3 images are required', 400);
	}

	for (const f of files) {
		if (!f.size || f.size > MAX_IMAGE_BYTES) {
			throw new AppError('VALIDATION_ERROR', 'Each image must be <= 5MB', 400);
		}
	}

	// Build room object according to schema
	const room = {
		landlord_id: landlordId,
		title: payload.title,
		room_type: payload.room_type,
		detailed_address: payload.detailed_address,
		max_capacity: Number(payload.max_capacity),
		monthly_rent: Number(payload.monthly_rent),
		deposit_amount: Number(payload.deposit_amount),
		electricity_cost: Number(payload.electricity_cost || 0),
		water_cost: Number(payload.water_cost || 0),
		internet_cost: Number(payload.internet_cost || 0),
		service_fee: Number(payload.service_fee || 0),
		room_description: payload.room_description || null,
		longitude: payload.longitude || null,
		latitude: payload.latitude || null,
	};

	// Save files to disk (uploads/rooms) and collect urls
	const savedUrls = [];
	const path = require('path');
	const fs = require('fs');
	const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'rooms');
	if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

	// Use transaction: insert room, images, approval
	return await db.transaction(async (trx) => {
		const created = await roomRepository.create(room, [], trx);

		const roomFolder = path.join(uploadDir, created.room_id);
		if (!fs.existsSync(roomFolder)) fs.mkdirSync(roomFolder, { recursive: true });

		files.forEach((file, idx) => {
			const ext = path.extname(file.originalname) || '.jpg';
			const filename = `${Date.now()}-${idx + 1}${ext}`;
			const outPath = path.join(roomFolder, filename);
			fs.writeFileSync(outPath, file.buffer);
			const publicPath = `/uploads/rooms/${created.room_id}/${filename}`;
			savedUrls.push(publicPath);
		});

		// Insert images into room_images table
		if (savedUrls.length) {
			const imgRows = savedUrls.map((url, idx) => ({
				room_id: created.room_id,
				sequence_number: idx + 1,
				image_url: url,
				is_cover: idx === 0,
			}));
			await trx('room_images').insert(imgRows);
		}

		// Insert approval record
		await trx('room_approvals').insert({ room_id: created.room_id, approval_status: 'PENDING' });

		return { roomId: created.room_id, approval: 'PENDING' };
	});
}

module.exports = {
	createRoom,
};
