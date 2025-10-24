import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ArrayMinSize,
  Min,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsNumber()
  @Min(1)
  totalPoints: number;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsArray()
  @ArrayMinSize(2)
  options: string[];

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @IsNumber()
  @Min(1)
  points: number;
}
