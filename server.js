const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// Endpoint para obtener vehículos con filtros
app.get("/vehicles", (req, res) => {
  const filePath = path.join(
    __dirname,
    "filtered_vehicles_data_corrected.json"
  );

  console.log("Ruta esperada del archivo:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("El archivo no existe en la ruta especificada:", filePath);
    return res
      .status(500)
      .json({ success: false, message: "Archivo no encontrado" });
  }

  // Leer el archivo JSON
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error leyendo el archivo:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al leer el archivo" });
    }

    try {
      let vehicles = JSON.parse(data); // Convertir el contenido en JSON

      // Aplicar filtros si existen en la consulta
      const { marca, modelo, year } = req.query;

      if (marca) {
        vehicles = vehicles.filter((v) =>
          v.Marca?.toLowerCase().includes(marca.toLowerCase())
        );
      }

      if (modelo) {
        vehicles = vehicles.filter((v) =>
          v.Modelo?.toLowerCase().includes(modelo.toLowerCase())
        );
      }

      if (year) {
        vehicles = vehicles.filter(
          (v) => v.Año && v.Año.toString() === year.toString()
        );
      }

      // Formatear precios para evitar decimales excesivos
      vehicles = vehicles.map((v) => ({
        ...v,
        Valor: parseFloat(v.Valor).toFixed(2),
      }));

      res.json({ success: true, data: vehicles });
    } catch (parseError) {
      console.error("Error al procesar el archivo JSON:", parseError);
      res
        .status(500)
        .json({ success: false, message: "Error al procesar los datos" });
    }
  });
});

// Configuración del servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
