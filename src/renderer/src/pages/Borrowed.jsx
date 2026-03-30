import Sidebar from '../components/Sidebar'
import './Borrowed.css'
import BorrowBookModal from '../components/Borrowed/BorrowBookModal'
import RenewModal from '../components/Borrowed/RenewModal'
import OverdueModal from '../components/Borrowed/OverdueModal'
import BorrowDetailsModal from '../components/Borrowed/BorrowDetailsModal'
import BorrowedHeader from '../components/Borrowed/BorrowedHeader'
import BorrowedTable from '../components/Borrowed/BorrowedTable'
import { useBorrowed } from '../hooks/useBorrowed'
import ConfirmReturnModal from '../components/Borrowed/ConfirmReturnModal'

const Borrowed = () => {
  const {
    refetch,
    isCollapsed,
    handleSidebarToggle,
    windowWidth,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleSearch,
    filterStatus,
    setFilterStatus,
    getFilteredBooks,
    highlightedId,
    pagination,
    totalPages,
    handlePageChange,
    fetchBorrowedData,
    refreshTable,
    formatDate,
    getRowClassName,
    getStatusBadgeClass,
    getStatusText,
    isOverdue,
    handleBorrowBook,
    isModalOpen,
    handleCloseModal,
    handleSubmitBorrow,
    isRenewModalOpen,
    setIsRenewModalOpen,
    selectedBorrow,
    handleReturnBook,
    handleRenewClick,
    handleOverdueClick,
    handleRowClick,
    isOverdueModalOpen,
    setIsOverdueModalOpen,
    selectedOverdue,
    handleRenewSubmit,
    handleOverdueSubmit,
    selectedBorrowDetails,
    setSelectedBorrowDetails,
    returnConfirm,
    handleConfirmReturn,
    handleCancelReturn,
  } = useBorrowed()

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`borrowed-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="borrowed-content">
          <BorrowedHeader
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            fetchBorrowedData={fetchBorrowedData}
            pagination={pagination}
            handleBorrowBook={handleBorrowBook}
          />

          <BorrowedTable
            isLoading={isLoading}
            getFilteredBooks={getFilteredBooks}
            searchTerm={searchTerm}
            highlightedId={highlightedId}
            getRowClassName={getRowClassName}
            windowWidth={windowWidth}
            handleRowClick={handleRowClick}
            formatDate={formatDate}
            getStatusBadgeClass={getStatusBadgeClass}
            getStatusText={getStatusText}
            pagination={pagination}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            handleRenewClick={handleRenewClick}
            handleReturnBook={handleReturnBook}
            handleOverdueClick={handleOverdueClick}
            isOverdue={isOverdue}
          />
        </div>
        <BorrowBookModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitBorrow}
        />
        <RenewModal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          onSubmit={handleRenewSubmit}
          borrowData={selectedBorrow || {}}
          onSuccess={refetch}
        />
        <OverdueModal
          isOpen={isOverdueModalOpen}
          onClose={() => setIsOverdueModalOpen(false)}
          onSubmit={handleOverdueSubmit}
          onSuccess={refreshTable} // Add this line
          borrowData={selectedOverdue || {}}
        />
        {selectedBorrowDetails && windowWidth <= 1500 && (
          <BorrowDetailsModal
            isOpen={!!selectedBorrowDetails}
            onClose={() => setSelectedBorrowDetails(null)}
            borrowData={selectedBorrowDetails}
            onReturn={handleReturnBook}
            onRenew={handleRenewClick}
            onPay={handleOverdueClick}
          />

        )}
        <ConfirmReturnModal
          isOpen={returnConfirm.isOpen}
          borrowItem={returnConfirm.borrowItem}
          onConfirm={handleConfirmReturn}
          onCancel={handleCancelReturn}
        />
      </div>
    </div>
  )
}

export default Borrowed
