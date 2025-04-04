import exp from "constants";

export type UserData = {
    user: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    language_code: string;
    photo_url: string;
    is_premium: boolean;
    }
};

export type PetId = {
    petId: string;
};

export type HookResponse = {

        status: number,
        statusText: string,
        headers: {
          server: string,
          date: string,
          'content-type': string,
          'content-length': number,
          connection: string,
          'strict-transport-security': string,
          'access-control-allow-origin': string,
          'access-control-expose-headers': string
        },
        body: { locked: boolean, state: string, supportsBYOB: boolean },
        bodyUsed: boolean,
        ok: boolean,
        redirected: boolean,
        type: string,
        url: string 
};
