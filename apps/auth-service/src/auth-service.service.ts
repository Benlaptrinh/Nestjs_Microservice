import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@app/database';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, role } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      role: role || UserRole.USER, // Default to USER role
    });

    await this.userRepository.save(user);

    // Generate token
    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
  }

  async oauthLogin(oauthUser: any) {
    if (!oauthUser) {
      throw new UnauthorizedException('No user from OAuth provider');
    }

    const { email, googleId, githubId, fullName, avatar, provider } = oauthUser;

    // Find existing user by OAuth ID or email
    let user = await this.userRepository.findOne({
      where: [
        { googleId: googleId || undefined },
        { githubId: githubId || undefined },
        { email },
      ],
    });

    if (user) {
      // Update OAuth info if user exists
      if (googleId) user.googleId = googleId;
      if (githubId) user.githubId = githubId;
      if (avatar && !user.avatar) user.avatar = avatar;
      user.provider = provider;
      await this.userRepository.save(user);
    } else {
      // Create new user
      user = this.userRepository.create({
        email,
        password: '', // OAuth users don't need password
        fullName,
        avatar,
        googleId,
        githubId,
        provider,
        role: UserRole.USER,
      });
      await this.userRepository.save(user);
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        provider: user.provider,
      },
    };
  }

  private generateToken(user: User): string {
    const payload = {     
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
