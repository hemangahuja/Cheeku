import express from "express";

const [basePort, count] = process.argv.slice(2);

const apps = new Array(Number(count)).fill(null).map(($) => express());

const handler =
    (num: number) => (req: express.Request, res: express.Response) => {
        const { method, url, headers, body } = req;
        res.send("Response from server " + num).status(200);
    };

apps.forEach((app, idx) => {
    app.get("*", handler(idx));
});

apps.forEach((app, idx) => {
    app.listen(Number(basePort) + idx);
});
