import {VercelRequest, VercelResponse} from '@vercel/node'
import { createServer } from './serverInit.js'

const handler: any = async (req: VercelRequest, resp: VercelResponse) => {
    try{
        const hapiServer: any = await createServer();
        const hapiResponse: any = await hapiServer.inject({
            method: req.method as any,
            url: req.url!,
            headers: req.headers,
            payload: req.body
        });

        resp.status(hapiResponse.statusCode).send(hapiResponse.payload);
    } catch (error) {
        console.error('Ошибка при обработке запроса:' , error);
        resp.status(500).json({
            error: "Произошла ошибка при обработке запроса"
        });
    }
}

export default handler;