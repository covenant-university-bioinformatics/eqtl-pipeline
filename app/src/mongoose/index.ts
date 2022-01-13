import * as mongoose from 'mongoose';
import { config } from '../config/mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb://${config.user}:${config.password}@${config.podName}-0.${config.host}:27017,${config.podName}-1.${config.host}:27017,${config.podName}-2.${config.host}:27017/?authSource=admin&replicaSet=rs0`,
      {
        dbName: config.dbName,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      },
    );
    console.log('Connected to Mongo DB');
  } catch (e) {
    console.log(e);
  }
};

export const closeDB = () => {
  mongoose.connection.close();
};

export default connectDB;
