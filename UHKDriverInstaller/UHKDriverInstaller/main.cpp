#include <iostream>
#include <Windows.h>
#include <Newdev.h>
#include <experimental/filesystem>

int main(int argc, char** argv) {
#if !defined(_WIN64)
	// If it is compiled on x86, but it is running on x64
	BOOL isWin64 = FALSE;
	if (!IsWow64Process(GetCurrentProcess(), &isWin64) || isWin64) {
		std::cerr << "Driver couldn't be installed on this system." << std::endl;
		if (isWin64) {
			std::cerr << "This installer cannot be run on x64 systems." << std::endl;
		}
		return 1;
	}
#   endif

	const char HARDWARE_ID[] = "USB\\VID_16D3&PID_05EA&MI_00";
	const char INF_FILE_PATH[] = "ultimate_hacking_keyboard_(interface_0)\\ultimate_hacking_keyboard_(interface_0).inf";

	std::experimental::filesystem::path absoluteInfPath(argv[0]);
	absoluteInfPath.replace_filename(INF_FILE_PATH);

	BOOL success = UpdateDriverForPlugAndPlayDevices(NULL, HARDWARE_ID, absoluteInfPath.string().c_str(), INSTALLFLAG_FORCE, NULL);

	if (success) {
		std::cout << "Driver has been succesfully installed." << std::endl;
	}
	else {
		const DWORD ERROR_CODE = GetLastError();
		std::cout << "An error occured during the driver installation. Reason: ";
		switch (ERROR_CODE) {
		case ERROR_ACCESS_DENIED:
			std::cout << "Access denied." << std::endl;
			break;
		case ERROR_FILE_NOT_FOUND:
			std::cout << "Inf file could not be found at " << absoluteInfPath << std::endl;
			break;
		case ERROR_IN_WOW64:
			std::cout << "The calling application is a 32-bit application attempting to execute in a 64-bit environment, which is not allowed." << std::endl;
			break;
		case ERROR_INVALID_FLAGS:
			std::cout << "Invalid flags." << std::endl;
			break;
		case ERROR_NO_SUCH_DEVINST:
			std::cout << "Device could not be found. Is it plugged in?" << std::endl;
			break;
		case ERROR_NO_MORE_ITEMS:
			std::cout << "ERROR_NO_MORE_ITEMS" << std::endl;
			break;
		default:
			std::cout << "Unknown. Error code: " << ERROR_CODE << std::endl;
			break;
		}
	}

	Sleep(2000);
	return success ? 0 : 1;
}