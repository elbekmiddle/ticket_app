import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

// JwtAuthGuard'dan KEYIN ishlatiladi — req.user allaqachon mavjud deb faraz qilinadi.
// isAdmin claim JWT payload'ning ichida (login vaqtida yozilgan), shuning uchun
// bu yerda qo'shimcha DB so'rovi shart emas — tez va sodda.
//
// Eslatma: agar admin statusi o'zgartirilsa (masalan userni admin qilib tayinlasangiz),
// eski access_token hali 15 daqiqa amal qiladi va yangi huquqni ko'rmaydi — user qayta
// login qilishi kerak bo'ladi. Bu ataylab shunday (stateless JWT tanlovi natijasi).
@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest()

		if (!req.user?.isAdmin) {
			throw new ForbiddenException('ADMIN_ACCESS_REQUIRED')
		}

		return true
	}
}
