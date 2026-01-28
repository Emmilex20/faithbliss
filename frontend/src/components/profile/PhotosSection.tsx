import { Upload, X, Sparkles } from 'lucide-react';
import type { ProfileData } from '@/types/profile'; // Assumed to exist
 // Assumed to exist

interface PhotosSectionProps {
    profileData: ProfileData;
    handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => void;
    removePhoto: (index: number) => void;
}

const PhotosSection = ({ profileData, handlePhotoUpload, removePhoto }: PhotosSectionProps) => {
    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-3xl p-8 border border-gray-700/50">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Your Photos</h2>
                    <p className="text-gray-400">Add up to 6 photos that show your personality</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profileData.photos.map((photo, index) => (
                        <div key={index} className="relative group aspect-[3/4] bg-gray-700 rounded-2xl overflow-hidden">
                            {photo ? (
                                <>
                                    {/* 💡 Vite/React Change: Replaced Next.js Image with standard img */}
                                    <img
                                        src={photo}
                                        alt={`Profile ${index + 1}`}
                                        className="w-full h-full object-cover absolute top-0 left-0"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => removePhoto(index)}
                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {index === 0 && (
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            MAIN
                                        </div>
                                    )}
                                </>
                            ) : (
                                <label className="absolute inset-0 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-gray-700 transition-all group">
                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-pink-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-400 group-hover:text-pink-500">Add Photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => handlePhotoUpload(event, index)}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    ))}
                </div>

                {/* Photo Tips Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl border border-pink-500/20">
                    <div className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-pink-400 mt-1" />
                        <div>
                            <h3 className="font-semibold text-pink-300 mb-1">Photo Tips</h3>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Use recent photos that clearly show your face</li>
                                <li>• Include variety - close-ups, full body, doing activities you love</li>
                                <li>• Smile naturally and let your personality shine</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotosSection;
