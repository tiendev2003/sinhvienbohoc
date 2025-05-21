import { useEffect, useState } from 'react';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('dropout'); // 'dropout', 'attendance', 'grades', 'faculty'
  const [timeRange, setTimeRange] = useState('semester'); // 'semester', 'year', 'custom'
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Simulate fetching data from API
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // const response = await api.get(`/admin/reports?type=${reportType}&timeRange=${timeRange}`);
        // setReportData(response.data);
        
        // Simulated data
        setTimeout(() => {
          // Different data based on report type
          if (reportType === 'dropout') {
            setReportData({
              title: 'Báo cáo tỷ lệ bỏ học',
              description: 'Phân tích tỷ lệ bỏ học theo thời gian và khoa',
              timeSeriesData: [
                { period: 'T1/2024', rate: 4.2 },
                { period: 'T2/2024', rate: 4.5 },
                { period: 'T3/2024', rate: 4.8 },
                { period: 'T4/2024', rate: 5.2 },
                { period: 'T5/2024', rate: 4.9 },
                { period: 'T6/2024', rate: 4.7 },
                { period: 'T7/2024', rate: 4.3 },
                { period: 'T8/2024', rate: 4.1 },
                { period: 'T9/2024', rate: 4.6 },
                { period: 'T10/2024', rate: 4.8 },
                { period: 'T11/2024', rate: 5.1 },
                { period: 'T12/2024', rate: 5.3 }
              ],
              categoryData: [
                { category: 'Công nghệ thông tin', value: 4.2 },
                { category: 'Kinh tế', value: 5.7 },
                { category: 'Kỹ thuật', value: 5.2 },
                { category: 'Xã hội học', value: 4.8 },
                { category: 'Y khoa', value: 3.5 },
                { category: 'Khác', value: 5.1 }
              ],
              summaryData: {
                averageRate: 4.8,
                highestRate: { category: 'Kinh tế', value: 5.7 },
                lowestRate: { category: 'Y khoa', value: 3.5 },
                trend: 'increasing' // 'increasing', 'decreasing', 'stable'
              }
            });
          } else if (reportType === 'attendance') {
            setReportData({
              title: 'Báo cáo tỷ lệ điểm danh',
              description: 'Phân tích tỷ lệ điểm danh theo lớp và thời gian',
              timeSeriesData: [
                { period: 'T1/2024', rate: 87.3 },
                { period: 'T2/2024', rate: 88.1 },
                { period: 'T3/2024', rate: 86.5 },
                { period: 'T4/2024', rate: 85.9 },
                { period: 'T5/2024', rate: 84.7 },
                { period: 'T6/2024', rate: 86.2 },
                { period: 'T7/2024', rate: 89.5 },
                { period: 'T8/2024', rate: 88.7 },
                { period: 'T9/2024', rate: 87.4 },
                { period: 'T10/2024', rate: 86.8 },
                { period: 'T11/2024', rate: 85.3 },
                { period: 'T12/2024', rate: 84.1 }
              ],
              categoryData: [
                { category: 'Công nghệ thông tin', value: 88.5 },
                { category: 'Kinh tế', value: 85.2 },
                { category: 'Kỹ thuật', value: 87.1 },
                { category: 'Xã hội học', value: 83.9 },
                { category: 'Y khoa', value: 92.4 },
                { category: 'Khác', value: 86.3 }
              ],
              summaryData: {
                averageRate: 86.5,
                highestRate: { category: 'Y khoa', value: 92.4 },
                lowestRate: { category: 'Xã hội học', value: 83.9 },
                trend: 'decreasing' // 'increasing', 'decreasing', 'stable'
              }
            });
          } else if (reportType === 'grades') {
            setReportData({
              title: 'Báo cáo điểm số',
              description: 'Phân tích điểm số trung bình theo lớp và thời gian',
              timeSeriesData: [
                { period: 'HK1/2022-2023', rate: 7.3 },
                { period: 'HK2/2022-2023', rate: 7.5 },
                { period: 'HK1/2023-2024', rate: 7.2 },
                { period: 'HK2/2023-2024', rate: 7.4 },
                { period: 'HK1/2024-2025', rate: 7.1 }
              ],
              categoryData: [
                { category: 'Công nghệ thông tin', value: 7.8 },
                { category: 'Kinh tế', value: 7.3 },
                { category: 'Kỹ thuật', value: 7.5 },
                { category: 'Xã hội học', value: 7.1 },
                { category: 'Y khoa', value: 8.2 },
                { category: 'Khác', value: 7.4 }
              ],
              distributionData: [
                { category: 'Xuất sắc (9.0-10.0)', value: 12 },
                { category: 'Giỏi (8.0-8.9)', value: 28 },
                { category: 'Khá (7.0-7.9)', value: 35 },
                { category: 'Trung bình (5.0-6.9)', value: 20 },
                { category: 'Yếu (4.0-4.9)', value: 3 },
                { category: 'Kém (0.0-3.9)', value: 2 }
              ],
              summaryData: {
                averageRate: 7.3,
                highestRate: { category: 'Y khoa', value: 8.2 },
                lowestRate: { category: 'Xã hội học', value: 7.1 },
                trend: 'stable' // 'increasing', 'decreasing', 'stable'
              }
            });
          } else if (reportType === 'faculty') {
            setReportData({
              title: 'Báo cáo theo khoa',
              description: 'So sánh các chỉ số chính giữa các khoa',
              comparativeData: [
                { 
                  category: 'Công nghệ thông tin',
                  attendanceRate: 88.5,
                  averageGrade: 7.8,
                  dropoutRate: 4.2,
                  highRiskPercentage: 5.4
                },
                { 
                  category: 'Kinh tế',
                  attendanceRate: 85.2,
                  averageGrade: 7.3,
                  dropoutRate: 5.7,
                  highRiskPercentage: 7.8
                },
                { 
                  category: 'Kỹ thuật',
                  attendanceRate: 87.1,
                  averageGrade: 7.5,
                  dropoutRate: 5.2,
                  highRiskPercentage: 6.2
                },
                { 
                  category: 'Xã hội học',
                  attendanceRate: 83.9,
                  averageGrade: 7.1,
                  dropoutRate: 4.8,
                  highRiskPercentage: 5.7
                },
                { 
                  category: 'Y khoa',
                  attendanceRate: 92.4,
                  averageGrade: 8.2,
                  dropoutRate: 3.5,
                  highRiskPercentage: 2.9
                },
                { 
                  category: 'Khác',
                  attendanceRate: 86.3,
                  averageGrade: 7.4,
                  dropoutRate: 5.1,
                  highRiskPercentage: 6.5
                }
              ],
              summaryData: {
                bestPerforming: 'Y khoa',
                worstPerforming: 'Kinh tế',
                recommendations: [
                  'Tăng cường tư vấn cho khoa Kinh tế',
                  'Nghiên cứu phương pháp từ khoa Y khoa',
                  'Cải thiện tỷ lệ điểm danh ở khoa Xã hội học'
                ]
              }
            });
          }
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [reportType, timeRange]);

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF
    console.log('Exporting report to PDF...');
    alert('Tính năng xuất PDF sẽ được triển khai trong phiên bản tới');
  };

  const handleExportExcel = () => {
    // In a real app, this would generate and download an Excel file
    console.log('Exporting report to Excel...');
    alert('Tính năng xuất Excel sẽ được triển khai trong phiên bản tới');
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu báo cáo...</div>;
  }

  return (
    <div className="reports p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo và Thống kê</h1>
        <div className="flex space-x-2">
          <Button type="button" variant="primary" onClick={handleExportPDF}>
            Xuất PDF
          </Button>
          <Button type="button" variant="secondary" onClick={handleExportExcel}>
            Xuất Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="report-type-selector">
          <select
            className="p-2 border rounded"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="dropout">Báo cáo bỏ học</option>
            <option value="attendance">Báo cáo điểm danh</option>
            <option value="grades">Báo cáo điểm số</option>
            <option value="faculty">Báo cáo theo khoa</option>
          </select>
        </div>

        <div className="time-range-selector flex space-x-2">
          <Button 
            type="button" 
            variant={timeRange === 'semester' ? 'primary' : 'secondary'}
            onClick={() => handleTimeRangeChange('semester')}
          >
            Học kỳ
          </Button>
          <Button 
            type="button" 
            variant={timeRange === 'year' ? 'primary' : 'secondary'}
            onClick={() => handleTimeRangeChange('year')}
          >
            Năm học
          </Button>
          <Button 
            type="button" 
            variant={timeRange === 'custom' ? 'primary' : 'secondary'}
            onClick={() => handleTimeRangeChange('custom')}
          >
            Tùy chỉnh
          </Button>
        </div>

        {timeRange === 'custom' && (
          <div className="custom-date-range flex space-x-2">
            <Input
              label="Từ ngày"
              id="startDate"
              type="date"
              value={customDateRange.startDate}
              onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
            />
            <Input
              label="Đến ngày"
              id="endDate"
              type="date"
              value={customDateRange.endDate}
              onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
            />
          </div>
        )}
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{reportData.title}</h2>
        <p className="text-gray-600 mb-6">{reportData.description}</p>

        {reportType !== 'faculty' && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Biểu đồ theo thời gian</h3>
            <div className="h-80">
              <LineChart 
                data={{
                  labels: reportData.timeSeriesData.map(item => item.period),
                  datasets: [
                    {
                      label: reportType === 'dropout' ? 'Tỷ lệ bỏ học (%)' : 
                             reportType === 'attendance' ? 'Tỷ lệ điểm danh (%)' : 'Điểm trung bình',
                      borderColor: reportType === 'dropout' ? '#ef4444' : '#3b82f6',
                      data: reportData.timeSeriesData.map(item => item.rate)
                    }
                  ]
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {reportType !== 'faculty' && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                {reportType === 'dropout' ? 'Tỷ lệ bỏ học theo khoa' : 
                 reportType === 'attendance' ? 'Tỷ lệ điểm danh theo khoa' : 'Điểm trung bình theo khoa'}
              </h3>
              <div className="h-80">
                <BarChart 
                  data={{
                    labels: reportData.categoryData.map(item => item.category),
                    datasets: [
                      {
                        label: reportType === 'dropout' ? 'Tỷ lệ bỏ học (%)' : 
                               reportType === 'attendance' ? 'Tỷ lệ điểm danh (%)' : 'Điểm trung bình',
                        backgroundColor: reportType === 'dropout' ? '#ef4444' : 
                                         reportType === 'attendance' ? '#10b981' : '#3b82f6',
                        data: reportData.categoryData.map(item => item.value)
                      }
                    ]
                  }}
                />
              </div>
            </div>
          )}

          {reportType === 'grades' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Phân bố điểm số</h3>
              <div className="h-80">
                <PieChart 
                  data={{
                    labels: reportData.distributionData.map(item => item.category),
                    datasets: [
                      {
                        data: reportData.distributionData.map(item => item.value),
                        backgroundColor: [
                          '#3b82f6', // blue
                          '#10b981', // green
                          '#f59e0b', // amber
                          '#8b5cf6', // purple
                          '#ef4444', // red
                          '#6b7280'  // gray
                        ]
                      }
                    ]
                  }}
                />
              </div>
            </div>
          )}
          
          {reportType === 'faculty' && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-4">Tỷ lệ điểm danh theo khoa</h3>
                <div className="h-80">
                  <BarChart 
                    data={{
                      labels: reportData.comparativeData.map(item => item.category),
                      datasets: [
                        {
                          label: 'Tỷ lệ điểm danh (%)',
                          backgroundColor: '#10b981',
                          data: reportData.comparativeData.map(item => item.attendanceRate)
                        }
                      ]
                    }}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Điểm trung bình theo khoa</h3>
                <div className="h-80">
                  <BarChart 
                    data={{
                      labels: reportData.comparativeData.map(item => item.category),
                      datasets: [
                        {
                          label: 'Điểm trung bình',
                          backgroundColor: '#3b82f6',
                          data: reportData.comparativeData.map(item => item.averageGrade)
                        }
                      ]
                    }}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Tỷ lệ bỏ học theo khoa</h3>
                <div className="h-80">
                  <BarChart 
                    data={{
                      labels: reportData.comparativeData.map(item => item.category),
                      datasets: [
                        {
                          label: 'Tỷ lệ bỏ học (%)',
                          backgroundColor: '#ef4444',
                          data: reportData.comparativeData.map(item => item.dropoutRate)
                        }
                      ]
                    }}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Tỷ lệ học sinh có nguy cơ cao</h3>
                <div className="h-80">
                  <BarChart 
                    data={{
                      labels: reportData.comparativeData.map(item => item.category),
                      datasets: [
                        {
                          label: 'Tỷ lệ nguy cơ cao (%)',
                          backgroundColor: '#f59e0b',
                          data: reportData.comparativeData.map(item => item.highRiskPercentage)
                        }
                      ]
                    }}
                  />
                </div>
              </div>
            </>
          )}
          
          {reportType !== 'faculty' && reportType !== 'grades' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Tóm tắt</h3>
              <div className="grid grid-cols-1 gap-4">
                <Card className="p-4 bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {reportType === 'dropout' ? 'Tỷ lệ bỏ học trung bình:' : 
                       reportType === 'attendance' ? 'Tỷ lệ điểm danh trung bình:' : 'Điểm trung bình:'}
                    </span>
                    <span className={`font-bold ${
                      reportType === 'dropout' ? 'text-red-600' : 
                      reportType === 'attendance' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {reportData.summaryData.averageRate}%
                    </span>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {reportType === 'dropout' ? 'Tỷ lệ bỏ học cao nhất:' : 
                       reportType === 'attendance' ? 'Tỷ lệ điểm danh cao nhất:' : 'Điểm cao nhất:'}
                    </span>
                    <div className="text-right">
                      <span className={`font-bold ${
                        reportType === 'dropout' ? 'text-red-600' : 
                        reportType === 'attendance' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {reportData.summaryData.highestRate.value}%
                      </span>
                      <span className="block text-sm text-gray-600">
                        {reportData.summaryData.highestRate.category}
                      </span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {reportType === 'dropout' ? 'Tỷ lệ bỏ học thấp nhất:' : 
                       reportType === 'attendance' ? 'Tỷ lệ điểm danh thấp nhất:' : 'Điểm thấp nhất:'}
                    </span>
                    <div className="text-right">
                      <span className={`font-bold ${
                        reportType === 'dropout' ? 'text-green-600' : 
                        reportType === 'attendance' ? 'text-red-600' : 'text-red-600'
                      }`}>
                        {reportData.summaryData.lowestRate.value}%
                      </span>
                      <span className="block text-sm text-gray-600">
                        {reportData.summaryData.lowestRate.category}
                      </span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">Xu hướng:</span>
                    <span className={`font-bold ${
                      reportData.summaryData.trend === 'increasing' 
                        ? (reportType === 'dropout' ? 'text-red-600' : 'text-green-600')
                        : reportData.summaryData.trend === 'decreasing'
                          ? (reportType === 'dropout' ? 'text-green-600' : 'text-red-600')
                          : 'text-blue-600'
                    }`}>
                      {reportData.summaryData.trend === 'increasing' 
                        ? 'Tăng' 
                        : reportData.summaryData.trend === 'decreasing' 
                          ? 'Giảm' 
                          : 'Ổn định'}
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          )}
          
          {reportType === 'faculty' && (
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">Tóm tắt và Khuyến nghị</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Đánh giá Tổng quan</h4>
                  <p>Khoa có hiệu suất tốt nhất: <span className="font-bold text-green-600">{reportData.summaryData.bestPerforming}</span></p>
                  <p>Khoa cần cải thiện nhất: <span className="font-bold text-red-600">{reportData.summaryData.worstPerforming}</span></p>
                </Card>
                
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Khuyến nghị</h4>
                  <ul className="list-disc pl-5">
                    {reportData.summaryData.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
