import React from 'react'
import { useSelector } from 'react-redux'

const ReportGenerator = () => {
  const { token } = useSelector((state) => state.auth)

  return (
    <div>
      <h1>Report Generator</h1>
      {/* Add your report generation content here */}
    </div>
  )
}

export default ReportGenerator
