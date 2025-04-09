export const allowCors = (fn: any) => async (req: any, res: any) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*"); // или указать домен
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Authorization, Content-Type"
    );
  
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
  
    return await fn(req, res);
  };