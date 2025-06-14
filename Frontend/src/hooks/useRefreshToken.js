import axios from 'axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.get('/api/refresh', {
            withCredentials: true
        });
        // console.log(response);
        setAuth({
            username: response.data.username,
            image: response.data.image,
            fullname: response.data.fullname,
            email: response.data.email,
            accessToken: response.data.accessToken,  
            streamToken: response.data.streamToken,
            isFirstLogin: response.data.isFirstLogin
        });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;