import "dotenv/config";

import { Elysia } from 'elysia';
import { node } from '@elysiajs/node';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

import userStats from "./routes/stats/user.js";
import health from "./routes/health/index.js";

export const app = new Elysia({ adapter: node() })
	.use(swagger())
	.use(cors())
	.use(health)
	.use(userStats)
	.listen(process.env["PORT"] || 3000, ({ port }) => {
		console.log(
			`🦊 Elysia is running at http://localhost:${port}`
		);
	});

export type App = typeof app;