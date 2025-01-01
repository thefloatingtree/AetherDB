import { Elysia } from 'elysia';

const routes = new Elysia()
    .get('/health', 200);

export default routes;