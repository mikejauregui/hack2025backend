import {
  RekognitionClient,
  CreateCollectionCommand,
  SearchFacesByImageCommand,
  IndexFacesCommand,
  DeleteCollectionCommand,
} from "@aws-sdk/client-rekognition"; // ES Modules import

const rekognition = new RekognitionClient({ region: "us-east-1" });
const collectionId = "mi-coleccion";

// Función para crear colección (si no existe)
async function crearColeccion() {
  try {
    await rekognition.send(
      new CreateCollectionCommand({ CollectionId: collectionId })
    );
    console.log("Colección creada");
  } catch (error) {
    if (error.code === "ResourceAlreadyExistsException")
      console.log("La colección ya existe");
    else console.error(error);
  }
}

// Indexar rostro con ID de usuario
// base64Image: cadena base64 de la imagen
// userId: string con el ID del usuario asociado
async function indexarRostro(image: string, userId: string) {
  const params = {
    CollectionId: collectionId,
    Image: {
      S3Object: {
        Bucket: "hacky-ando",
        Name: image,
      },
    },
    ExternalImageId: userId, // Aquí se asocia el ID con el rostro
    DetectionAttributes: [],
  };

  try {
    let responseObj = new IndexFacesCommand(params);
    const response = await rekognition.send(responseObj);
    console.log(
      `Rostro(s) indexado(s) para usuario ${userId}:`,
      response.FaceRecords
    );
    return response.FaceRecords;
  } catch (error) {
    console.error("Error indexando rostro:", error);
  }
}

// Buscar rostro y obtener ID de usuario asociado
export async function identificarUsuario(image: string) {
  const params = {
    CollectionId: collectionId,
    Image: {
      S3Object: {
        Bucket: "hacky-ando",
        Name: image,
      },
    },
    FaceMatchThreshold: 85,
    MaxFaces: 1,
  };

  try {
    const responseObj = new SearchFacesByImageCommand(params);
    const response = await rekognition.send(responseObj);
    if (response?.FaceMatches && response?.FaceMatches?.length > 0) {
      let face = response?.FaceMatches[0]?.Face;
      console.log(
        `Rostro identificado. UserID: ${face?.ExternalImageId}, Similaridad: ${response?.FaceMatches[0]?.Similarity}`
      );
      return face?.ExternalImageId;
    } else {
      console.log("No se encontró un rostro coincidente");
      return null;
    }
  } catch (error) {
    console.error("Error buscando rostro:", error);
  }
}

async function eliminarColeccion() {
  const params = {
    CollectionId: collectionId,
  };

  await rekognition
    .send(new DeleteCollectionCommand(params))
    .then((data) => {
      console.log("Colección eliminada:", data);
    })
    .catch((error) => {
      console.error("Error eliminando colección:", error);
    });
}

// try {
//   await eliminarColeccion();
// } catch (error) {
//   console.warn("Error en la eliminación de la colección:", error);
// }
// // Ejemplo de ejecución
// await crearColeccion();

// await indexarRostro("iddar.png", "b3b1d743-564d-46b1-89f4-2543399f4055");
// await indexarRostro("diana.jpg", "diana-1234");

// Luego, para identificar quién es con otra imagen:
// const otraImagenBase64 = "diana2.jpg";

// const userIdDetectado = await identificarUsuario(otraImagenBase64);
// console.log("ID de usuario identificado:", userIdDetectado);
