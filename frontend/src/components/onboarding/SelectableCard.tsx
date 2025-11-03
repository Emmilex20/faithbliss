import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SelectableCardProps {
  label: string;
  emoji?: string;
  isSelected: boolean;
  onClick: () => void;
}

const SelectableCard = ({ label, emoji, isSelected, onClick }: SelectableCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all duration-200 ${
        isSelected
          ? 'border-pink-500 bg-pink-500/20'
          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      {isSelected && (
        <div className="absolute -right-2 -top-2 rounded-full bg-pink-500 p-1 text-white">
          <CheckCircle size={16} />
        </div>
      )}
      {emoji && <div className="text-3xl">{emoji}</div>}
      <div className="mt-2 font-semibold text-white">{label}</div>
    </motion.div>
  );
};

export default SelectableCard;
