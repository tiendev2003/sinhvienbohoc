import { Link } from 'react-router';

const StatCard = ({ title, value, icon, trend, trendDirection, linkTo, linkText }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          
          {trend && (
            <p className={`mt-2 text-sm ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendDirection === 'up' ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="rounded-md bg-blue-50 p-3">
            {icon}
          </div>
        )}
      </div>
      
      {linkTo && (
        <div className="mt-4">
          <Link to={linkTo} className="text-blue-600 hover:text-blue-800 text-sm">
            {linkText || 'View details'} →
          </Link>
        </div>
      )}
    </div>
  );
};

export default StatCard;
