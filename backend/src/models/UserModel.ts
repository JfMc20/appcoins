import mongoose, { Schema, Document } from 'mongoose';
// Aquí iría la lógica para el hasheo de contraseñas, ej: import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Se omite en las respuestas de la API, solo para creación/actualización
  role: 'operator' | 'admin';
  displayName?: string;
  status: 'active' | 'inactive' | 'pending_verification';
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  // createdAt y updatedAt son añadidos automáticamente por timestamps: true
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Buena práctica para usernames
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      // Podrías añadir una validación de formato de email con match: /regex_para_email/
    },
    password: {
      type: String,
      required: true,
      // Select false para que no se devuelva por defecto en las consultas
      // La contraseña solo se debe manejar en la creación y actualización, con hasheo.
      select: false,
    },
    role: {
      type: String,
      enum: ['operator', 'admin'],
      required: true,
      default: 'operator',
    },
    displayName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_verification'],
      default: 'active',
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pre-save para hashear la contraseña antes de guardarla
// UserSchema.pre<IUser>('save', async function (next) {
//   if (!this.isModified('password') || !this.password) {
//     return next();
//   }
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error: any) {
//     next(error);
//   }
// });

// Método para comparar contraseñas (se añadiría al esquema)
// UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
//   if (!this.password) return false;
//   return bcrypt.compare(candidatePassword, this.password);
// };

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel; 