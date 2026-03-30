import React from 'react'
import './styles/ConfirmReturnModal.css'
import { Button } from '../ui/button'

const ConfirmReturnModal = ({ isOpen, borrowItem, onConfirm, onCancel }) => {
    if (!isOpen || !borrowItem) return null

    return (
        <div className="return-modal-overlay">
            <div className="return-modal-content">
                <div className="return-modal-header">
                    <h3>Confirm Return</h3>
                </div>
                <div className="return-modal-body">
                    <p>
                        Are you sure you want to return <strong>{borrowItem.book_title}</strong> borrowed by{' '}
                        <strong>{borrowItem.student_name}</strong>?
                    </p>
                    <p className="return-warning">This action cannot be undone.</p>
                </div>
                <div className="return-modal-footer">
                    <Button variant='secondary' onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant='primary' onClick={onConfirm}>
                        Confirm Return
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmReturnModal