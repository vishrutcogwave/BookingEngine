import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navi = useNavigate();
  const handelNavigate = ()=>{
    navi("/")
  }
  return (
    <nav className="bg-clarity-white border-b border-balance-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <div className="w-32 h-16 flex items-center">
                <img 
                onClick={handelNavigate} 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-auto object-contain"
                  style={{ aspectRatio: '2/1' }}
                />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;