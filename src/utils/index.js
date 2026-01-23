import bcrypt from 'bcrypt';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const createHash = async (password) => {
    const salts = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salts);
}

export const passwordValidation = async (user, password) => bcrypt.compare(password, user.password);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;