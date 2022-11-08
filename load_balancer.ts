import express from "express";
import axios from "axios";
import path from "path";
const sprightly = require("sprightly");

const [basePort, _count, algorithm] = process.argv.slice(2);
const count = Number(_count);
const app = express();
app.engine("spy", sprightly);
app.set("view engine", "spy");
app.set("views", "./");
let current = 0;
let requestCountCurrent = 0;

const hashCode = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const getServer = (options?: object): number => {
    switch (algorithm) {
        case "round-robin": {
            return current++ % count;
        }
        case "weighted-round-robin": {
            const limit = count - current;
            requestCountCurrent++;
            if (requestCountCurrent > limit) {
                requestCountCurrent = 0;
                current++;
            }
            return current % count;
        }
        case "random": {
            return Math.round(Math.random() * (count - 1));
        }
        case "url-hash": {
            const hash = hashCode(JSON.stringify(options)) % count;
            return hash < 0 ? count + hash : hash;
        }
    }
    return 0;
};

const handler = async (req: express.Request, res: express.Response) => {
    const { method, headers, body, url, query } = req;
    const data = {
        url,
        method: method,
        headers: headers,
        data: body,
        query,
    };
    const server = `http://localhost:${
        Number(basePort) +
        getServer({
            query,
            method,
            body,
        })
    }`;
    try {
        data.url = `${server}${url}`;
        const response = await axios(data);
        res.render("index.spy", {
            server: response.data.server + 1,
            message: response.data.data,
            algorithm,
        });
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
