import express from "express";
import { generateKeyPair } from "crypto";

const [basePort, count] = process.argv.slice(2);

const apps = new Array(Number(count)).fill(null).map(($) => express());
const heavyComputation = async (): Promise<any> => {
    return new Promise((resolve) => {
        generateKeyPair(
            "rsa",
            {
                modulusLength: 1024,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem",
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem",
                },
            },
            (err: Error | null, publicKey: string, privateKey: string) => {
                if (err) return err;
                resolve(publicKey + privateKey);
            }
        );
    });
};

const handler =
    (num: number) => async (req: express.Request, res: express.Response) => {
        const { method, url, headers, body } = req;

        const ress = await heavyComputation();
        res.json({
            server: num,
            data: ress,
        }).status(200);
    };

apps.forEach((app, idx) => {
    app.get("*", handler(idx));
});

apps.forEach((app, idx) => {
    app.listen(Number(basePort) + idx);
});
