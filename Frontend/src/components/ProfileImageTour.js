import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const ProfileImageTour = ({ isFirstLogin, onTourComplete }) => {
    const [run, setRun] = useState(false);
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        console.log('isFirstLogin:', isFirstLogin);
        if (isFirstLogin) {
            console.log('Starting tour...');
            setRun(true);
        }
    }, [isFirstLogin]);

    const steps = [
        {
            target: '.profile-image-section',
            content: 'Để sử dụng các tính năng của ứng dụng, bạn cần cập nhật ảnh đại diện của mình. Ảnh phải là ảnh chân dung rõ ràng của bạn.',
            disableBeacon: true,
        },
        {
            target: '.upload-image-button',
            content: 'Nhấp vào nút này để tải lên ảnh đại diện của bạn.',
            disableBeacon: true,
        },
        {
            target: '.image-preview',
            content: 'Sau khi tải lên, bạn có thể xem trước ảnh đại diện của mình tại đây.',
            disableBeacon: true,
        },
        {
            target: '.save-profile-button',
            content: 'Nhấp vào nút Lưu để hoàn tất việc cập nhật ảnh đại diện.',
            disableBeacon: true,
        }
    ];

    const handleJoyrideCallback = async (data) => {
        const { status, type } = data;
        console.log('Tour status:', status);

        if (status === 'finished' || status === 'skipped') {
            setRun(false);
            try {
                await axiosPrivate.put('/api/user/update-first-login');
                onTourComplete();
            } catch (error) {
                console.error('Error updating first login status:', error);
            }
        }
    };

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

export default ProfileImageTour; 