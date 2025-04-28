import React from 'react';

const ScamWarning = ({ confidence, reason }) => {
    return (
        <div style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: '#fffbe6',
            border: '1px solid #ffe58f',
            borderRadius: '4px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
            }}>
                <span style={{
                    fontSize: '16px',
                    marginRight: '8px',
                }}>⚠️</span>
                <span style={{
                    fontWeight: 'bold',
                    color: '#faad14',
                }}>Cảnh báo: Tin nhắn có dấu hiệu lừa đảo</span>
            </div>
            <div style={{
                color: '#666',
            }}>
                <p style={{
                    margin: '4px 0',
                }}>Độ tin cậy: {Math.round(confidence * 100)}%</p>
                <p style={{
                    margin: '4px 0',
                }}>Lý do: {reason}</p>
            </div>
        </div>
    );
};

export default ScamWarning; 