import { useMessageContext, MessageSimple } from "stream-chat-react";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

const CustomMessage = ({ scamAnalysis }) => {
  const { message } = useMessageContext();
  const [scamData, setScamData] = useState(null);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    if (message && scamAnalysis) {
      setScamData(scamAnalysis[message.id]);
      setShowWarning(true); // Reset showWarning khi có message mới
    }
  }, [message, scamAnalysis]);

  if (!message) return null;

  return (
    <div className="relative">
      {scamData?.isScam && showWarning && (
        <div className="mt-2 p-2 bg-red-100 text-red-600 text-sm rounded-lg relative">
          <button 
            onClick={() => setShowWarning(false)}
            className="absolute top-1 right-1 text-red-600 hover:text-red-800"
          >
            <IoClose size={18} />
          </button>
          ⚠️ <strong>Cảnh báo lừa đảo!</strong> ({Math.round(scamData.confidence * 100)}%)  
          <br />
          <strong>Lý do:</strong> {scamData.reason}
        </div>
      )}
      <MessageSimple />
    </div>
  );
};

export default CustomMessage; 