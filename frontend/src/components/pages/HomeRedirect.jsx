import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHotelId } from "../../services/api";

const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const hotelId = await getHotelId(); // ✅ resolved number
        console.log("hotelId:", hotelId);

        if (!hotelId) return;

        navigate(`/hotel/${hotelId}`, { replace: true });
      } catch (error) {
        console.error("Redirect failed:", error);
      }
    })();
  }, [navigate]);

  return null; // or loading spinner
};

export default HomeRedirect;