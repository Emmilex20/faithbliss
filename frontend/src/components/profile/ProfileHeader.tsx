import { ArrowLeft, Edit3, Settings } from 'lucide-react';
// 💡 Vite/React Change: Use useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom'; 

const ProfileHeader = () => {
    // 💡 Vite/React Change: Replace useRouter with useNavigate
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 z-30 px-4 py-4">
            <div className="flex items-center justify-between">
                <button
                    // 💡 Vite/React Change: navigate(-1) simulates router.back()
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                </button>
                
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    My Profile
                </h1>
                
                <div className="flex gap-3">
                    {/* The Edit3 button's functionality is left as a placeholder */}
                    <button className="p-2 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors">
                        <Edit3 className="w-5 h-5 text-gray-300" />
                    </button>
                    {/* The Settings button's functionality is left as a placeholder */}
                    <button className="p-2 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors">
                        <Settings className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;