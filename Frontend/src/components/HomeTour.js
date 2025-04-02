import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useNavigate, useLocation } from 'react-router-dom';

const HomeTour = ({ isFirstLogin, onTourComplete }) => {
    const [run, setRun] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        console.log('isFirstLogin:', isFirstLogin);
        if (isFirstLogin) {
            console.log('Starting home tour...');
            setRun(true);
        }
    }, [isFirstLogin]);

    const steps = [
        {
            target: '.settings-button', // Thêm class này vào nút settings trong navbar
            content: 'Để cập nhật thông tin cá nhân và ảnh đại diện, hãy nhấp vào đây để vào trang Cài đặt.',
            disableBeacon: true,
        }
    ];

    const handleJoyrideCallback = async (data) => {
        const { status, type } = data;
        console.log('Tour status:', status);

        if (status === 'finished' || status === 'skipped') {
            setRun(false);
            try {
                onTourComplete();
                navigate('/settings');
            } catch (error) {
                console.error('Error updating first login status:', error);
            }
        }
    };

    // Chỉ hiển thị tour ở trang chủ
    if (location.pathname !== '/') {
        return null;
    }

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            styles={{
                options: {
                    primaryColor: '#007bff',
                    zIndex: 1000,
                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                    arrowColor: '#fff',
                    backgroundColor: '#fff',
                    textColor: '#333',
                },
            }}
            callback={handleJoyrideCallback}
        />
    );
};

export default HomeTour; 