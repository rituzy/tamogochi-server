import {VercelRequest, VercelResponse} from '@vercel/node'
import { createServer } from './serverInit'

const handler: any = async (req: VercelRequest, resp: VercelResponse) => {
    try{
        const hapiServer: any = await createServer();

    } catch (error) {
        console.error('Ошибка при обработке запроса:' , error);
        resp.status(500).json({
            error: "Произошла ошибка при обработке запроса"
        });
    }
    resp.status(200).send('Hello from Vercel');
}

export default handler;