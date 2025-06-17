// Http Client Singleton
import axios from "axios";

const axiosClient = axios.create({
  withCredentials: true,
});

export default axiosClient;
