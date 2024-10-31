async function AuthorizePostRequest(req, res, next) {
    if (req.method !== 'POST') return next();
    const API = process.env.API_URL;
    if (req.originalUrl.startsWith(`${API}/admin`)) return next();

    const endpoint = [];
}