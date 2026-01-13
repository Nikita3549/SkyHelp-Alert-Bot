import { Injectable } from '@nestjs/common';
import checkDiskSpace from 'check-disk-space';
import { ConfigService } from '@nestjs/config';
import { ISSDStatus } from './interfaces/ssd-status.interface';
import { IRamStatus } from './interfaces/ram-status.interface';
import * as si from 'systeminformation';

@Injectable()
export class SystemService {
    constructor(private readonly configService: ConfigService) {}

    async getSSDStatus(): Promise<ISSDStatus> {
        const path =
            this.configService.getOrThrow('NODE_ENV') == 'production'
                ? '/host'
                : '/';

        const diskSpace = await checkDiskSpace(path);

        const totalGB = (diskSpace.size / 1024 / 1024 / 1024).toFixed(0);
        const freeGB = (diskSpace.free / 1024 / 1024 / 1024).toFixed(0);
        const usedGB = (
            (diskSpace.size - diskSpace.free) /
            1024 /
            1024 /
            1024
        ).toFixed(0);
        const usedPercentage = (
            ((diskSpace.size - diskSpace.free) / diskSpace.size) *
            100
        ).toFixed(0);

        return {
            totalGB,
            usedGB,
            freeGB,
            usedPercentage,
        };
    }

    async getRamStatus(): Promise<IRamStatus> {
        const mem = await si.mem();

        const totalGB = (mem.total / 1024 / 1024 / 1024).toFixed(1);
        const availableGB = (mem.available / 1024 / 1024 / 1024).toFixed(1);
        const usedGB = (
            (mem.total - mem.available) /
            1024 /
            1024 /
            1024
        ).toFixed(1);
        const usedPercentage = (
            ((mem.total - mem.available) / mem.total) *
            100
        ).toFixed(0);

        return {
            totalGB,
            usedGB,
            availableGB,
            usedPercentage,
        };
    }
}
