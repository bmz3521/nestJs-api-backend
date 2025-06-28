import { Menu, Status } from '@prisma/client'

export const MENU_MANAGEMENT_REPOSITORY = 'IMenuManagementRepository'

export interface MenuWithRelations extends Menu {
    status: Status
}

export interface IMenuManagementRepository {
    findAll(status?: number): Promise<MenuWithRelations[]>

    findById(id: string): Promise<MenuWithRelations | null>
}
