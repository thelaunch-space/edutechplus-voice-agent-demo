import Vapi from '@vapi-ai/web';

const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// Create a single instance
let vapiInstance = null;

export const getVapi = () => {
    if (!vapiInstance) {
        if (!publicKey || publicKey === 'your_vapi_public_key_here') {
            console.error('VAPI_PUBLIC_KEY not configured in .env');
            return null;
        }
        vapiInstance = new Vapi(publicKey);
    }
    return vapiInstance;
};
