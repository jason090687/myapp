import React from 'react'
import { Button } from '../ui/button'
import { Filter, Plus } from 'lucide-react'
import { FaSearch } from 'react-icons/fa'

const EmployeeHeader = ({ filterStatus, setFilterStatus, setIsAddModalOpen }) => {
    return (
        <div className="students-header">
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search staff..."
                    className="search-input"
                    aria-label="Search staff"
                    disabled
                />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Filter
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '0.75rem',
                            color: '#64748b',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                        style={{
                            padding: '0.5rem 2.5rem 0.5rem 2.25rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#334155',
                            outline: 'none',
                            transition: 'all 0.2s',
                            appearance: 'none',
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center'
                        }}
                        onMouseEnter={(e) => (e.target.style.borderColor = '#cbd5e1')}
                        onMouseLeave={(e) => (e.target.style.borderColor = '#e2e8f0')}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsAddModalOpen(true)}
                    className="gap-2"
                    title="Add Staff"
                    aria-label="Add staff"
                >
                    <Plus size={18} />
                    Add New Employee
                </Button>
            </div>
        </div>
    )
}

export default EmployeeHeader
