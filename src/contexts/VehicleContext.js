import React, { createContext, useState } from "react";

export const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const addVehicle = (newVehicle) => {
    setVehicles((prev) => [...prev, newVehicle]);
  };

const updateVehicle = (id, updatedData) => {
  setVehicles(prev =>
    prev.map(v => (v.id === id ? { ...v, ...updatedData } : v))
  );
};

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        addVehicle,
        updateVehicle, 
        selectedVehicle,
        setSelectedVehicle,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};
