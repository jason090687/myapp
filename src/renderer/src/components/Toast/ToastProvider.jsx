import { ToastContainer as ReactToastifyContainer, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ToastProvider = () => {
  return (
    <ReactToastifyContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  )
}

export default ToastProvider
