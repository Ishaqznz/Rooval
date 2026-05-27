const ChartBar: React.FC<{ height: number; month: string; maxHeight: number }> = ({ 
  height, 
  month, 
  maxHeight 
}) => {
  const barHeight = (height / maxHeight) * 240;
  
  return (
    <div className="flex flex-col items-center flex-1">
      <div 
        className="bg-blue-500 rounded-t-md w-full mb-2 transition-all duration-300 hover:bg-blue-600"
        style={{ height: `${barHeight}px` }}
      ></div>
      <span className="text-xs text-gray-500">{month}</span>
    </div>
  );
};

export default ChartBar