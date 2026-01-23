export default class DocumentDTO {
    static getDocumentInputFrom = (file) => {
        return {
            name: file.originalname,
            reference: `/documents/${file.filename}`,
            type: this.determineDocumentType(file.originalname),
            uploadDate: new Date()
        }
    }

    static determineDocumentType(filename) {
        const lowerFilename = filename.toLowerCase();

        if (lowerFilename.includes('dni') || lowerFilename.includes('identificacion') ||
            lowerFilename.includes('cedula') || lowerFilename.includes('pasaporte')) {
            return 'identification';
        }

        if (lowerFilename.includes('domicilio') || lowerFilename.includes('direccion') ||
            lowerFilename.includes('residencia') || lowerFilename.includes('servicio')) {
            return 'address';
        }

        if (lowerFilename.includes('cuenta') || lowerFilename.includes('estado') ||
            lowerFilename.includes('extrato') || lowerFilename.includes('bank')) {
            return 'account';
        }

        return 'other';
    }
}