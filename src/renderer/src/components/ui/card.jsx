import './card.css'

const Card = ({ icon: Icon, title, value, clickable = false, onClick, loading = false }) => {
  return (
    <div
      className={`card-component ${clickable ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className="card-icon">
        <Icon />
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className={loading ? 'loading' : ''}>{value}</p>
      </div>
    </div>
  )
}

export { Card }
