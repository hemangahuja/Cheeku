import express from "express";
import axios from "axios";
import path from "path";

const [basePort, count] = process.argv.slice(2);

const app = express();

let current = 0;

const handler = async (req: express.Request, res: express.Response) => {
    const { method, url, headers, body } = req;

    const server = `http://localhost:${
        Number(basePort) + (current++ % Number(count))
    }`;
    try {
        const response = await axios({
            url: `${server}${url}`,
            method: method,
            headers: headers,
            data: body,
        });
        res.send(response.data);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error!");
    }
};
app.get("/favicon.ico", (req, res) =>
    res.sendFile(path.join(__dirname, "/favicon.ico"))
);
app.use(handler);

app.listen(8080, () => console.log("Load balancer running at port 8080"));
