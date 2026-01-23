import fs from 'fs';
import multer from 'multer';
import path from 'path';
import __dirname from "./index.js";

const ensureDirectories = () => {
  const directories = [
    path.join(__dirname, '../public/img/pets'),
    path.join(__dirname, '../public/img/profiles'),
    path.join(__dirname, '../public/documents'),
    path.join(__dirname, '../public/temp')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '../public/temp');

    if (req.originalUrl.includes('/pets/')) {
      uploadPath = path.join(__dirname, '../public/img/pets');
    } else if (req.originalUrl.includes('/users/') && req.originalUrl.includes('/documents')) {
      uploadPath = path.join(__dirname, '../public/documents');
    } else if (req.originalUrl.includes('/profiles/')) {
      uploadPath = path.join(__dirname, '../public/img/profiles');
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|txt|rtf|odt/;

  const isImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
  const isDocument = allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());

  if (req.originalUrl.includes('/pets/') && !isImage) {
    return cb(new Error('Solo se permiten imágenes para mascotas'), false);
  }

  if (req.originalUrl.includes('/documents') && !isDocument && !isImage) {
    return cb(new Error('Tipo de archivo no permitido para documentos'), false);
  }

  if (isImage || isDocument) {
    return cb(null, true);
  }

  cb(new Error('Tipo de archivo no soportado'), false);
};

const limits = {
  fileSize: 10 * 1024 * 1024,
  files: 10
};


const uploader = multer({
  storage,
  fileFilter,
  limits
});


export const petsUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/img/pets'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'pet-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes para mascotas'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const documentsUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/documents'));
    },
    filename: (req, file, cb) => {
      const userId = req.params.uid;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = path.parse(file.originalname).name;
      cb(null, `user-${userId}-${originalName}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|rtf|odt|jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de documento no permitido. Use: PDF, DOC, DOCX, TXT, RTF, ODT o imágenes'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export default uploader;