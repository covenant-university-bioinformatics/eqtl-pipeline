import * as mongoose from 'mongoose';
import { UserDoc } from '../../auth/models/user.model';
import { EqtlDoc } from './eqtl.model';

export enum JobStatus {
  COMPLETED = 'completed',
  RUNNING = 'running',
  FAILED = 'failed',
  ABORTED = 'aborted',
  NOTSTARTED = 'not-started',
  QUEUED = 'queued',
}

//Interface that describe the properties that are required to create a new job
interface JobsAttrs {
  jobUID: string;
  job_name: string;
  status: JobStatus;
  user?: string;
  email?: string;
  inputFile: string;
  longJob: boolean;
}

// An interface that describes the extra properties that a model has
//collection level methods
interface JobsModel extends mongoose.Model<EqtlJobsDoc> {
  build(attrs: JobsAttrs): EqtlJobsDoc;
}

//An interface that describes a properties that a document has
export interface EqtlJobsDoc extends mongoose.Document {
  id: string;
  jobUID: string;
  job_name: string;
  inputFile: string;
  status: JobStatus;
  user?: UserDoc;
  email?: string;
  failed_reason: string;
  longJob: boolean;
  eqtl_params: EqtlDoc;
  cageSMRFile: string;
  cageTransFile: string;
  cageMultiFile: string;
  cageSMRManhattanPlot: string;
  cageSMRQQPlot: string;
  cageMultiManhattanPlot: string;
  cageMultiQQPlot: string;
  tissueSMRFile: string;
  tissueTransFile: string;
  tissueMultiFile: string;
  tissueSMRManhattanPlot: string;
  tissueSMRQQPlot: string;
  tissueMultiManhattanPlot: string;
  tissueMultiQQPlot: string;
  westraSMRFile: string;
  westraTransFile: string;
  westraMultiFile: string;
  westraSMRManhattanPlot: string;
  westraSMRQQPlot: string;
  westraMultiManhattanPlot: string;
  westraMultiQQPlot: string;
  version: number;
  completionTime: Date;
}

const EqtlJobSchema = new mongoose.Schema<EqtlJobsDoc, JobsModel>(
  {
    jobUID: {
      type: String,
      required: [true, 'Please add a Job UID'],
      unique: true,
      trim: true,
    },

    job_name: {
      type: String,
      required: [true, 'Please add a name'],
    },

    inputFile: {
      type: String,
      required: [true, 'Please add a input filename'],
      unique: true,
      trim: true,
    },

    cageSMRFile: {
      type: String,
      trim: true,
    },
    cageTransFile: {
      type: String,
      trim: true,
    },
    cageMultiFile: {
      type: String,
      trim: true,
    },
    cageSMRManhattanPlot: {
      type: String,
      trim: true,
    },
    cageSMRQQPlot: {
      type: String,
      trim: true,
    },
    cageMultiManhattanPlot: {
      type: String,
      trim: true,
    },
    cageMultiQQPlot: {
      type: String,
      trim: true,
    },

    tissueSMRFile: {
      type: String,
      trim: true,
    },
    tissueTransFile: {
      type: String,
      trim: true,
    },
    tissueMultiFile: {
      type: String,
      trim: true,
    },
    tissueSMRManhattanPlot: {
      type: String,
      trim: true,
    },
    tissueSMRQQPlot: {
      type: String,
      trim: true,
    },
    tissueMultiManhattanPlot: {
      type: String,
      trim: true,
    },
    tissueMultiQQPlot: {
      type: String,
      trim: true,
    },

    westraSMRFile: {
      type: String,
      trim: true,
    },
    westraTransFile: {
      type: String,
      trim: true,
    },
    westraMultiFile: {
      type: String,
      trim: true,
    },
    westraSMRManhattanPlot: {
      type: String,
      trim: true,
    },
    westraSMRQQPlot: {
      type: String,
      trim: true,
    },
    westraMultiManhattanPlot: {
      type: String,
      trim: true,
    },
    westraMultiQQPlot: {
      type: String,
      trim: true,
    },

    failed_reason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        JobStatus.COMPLETED,
        JobStatus.NOTSTARTED,
        JobStatus.RUNNING,
        JobStatus.FAILED,
        JobStatus.ABORTED,
        JobStatus.QUEUED,
      ],
      default: JobStatus.NOTSTARTED,
    },
    longJob: {
      type: Boolean,
      default: false,
    },
    completionTime: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    email: {
      type: String,
      trim: true,
    },
    version: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        // delete ret._id;
        // delete ret.__v;
      },
    },
  },
);

//increments version when document updates
// jobsSchema.set("versionKey", "version");

//collection level methods
EqtlJobSchema.statics.build = (attrs: JobsAttrs) => {
  return new EqtlJobsModel(attrs);
};

//Cascade delete main job parameters when job is deleted
EqtlJobSchema.pre('remove', async function (next) {
  console.log('Job parameters being removed!');
  await this.model('Eqtl').deleteMany({
    job: this.id,
  });
  next();
});

//reverse populate jobs with main job parameters
EqtlJobSchema.virtual('eqtl_params', {
  ref: 'Eqtl',
  localField: '_id',
  foreignField: 'job',
  required: true,
  justOne: true,
});

EqtlJobSchema.set('versionKey', 'version');

//create mongoose model
const EqtlJobsModel = mongoose.model<EqtlJobsDoc, JobsModel>(
  'EqtlJob',
  EqtlJobSchema,
  'eqtljobs',
);

export { EqtlJobsModel };
