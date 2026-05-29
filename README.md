# MediCare - Medicine Reminder System

Managing daily medication regimens is critically important but can be very challenging for elderly patients. Traditional digital solutions often fall short because of the following issues:

* Poor accessibility due to small text, low contrast, and complex, cluttered user interfaces.
* Lack of audio feedback, making it difficult for users with visual impairments or reading difficulties to follow their schedules.
* The dangerous risk of patients taking the wrong pill due to confusion over similar-looking medications or memory issues.
* General anxiety and a steep learning curve when using complex technological tools without adequate guidance.

## How We Solved It

MediCare was built from the ground up to solve these specific challenges through thoughtful design and assistive technology:

* **High-Contrast, Accessible Design:** We completely overhauled the interface to remove gradients, complex colors, and distracting animations. The application uses a strict black-and-white, high-contrast theme with large typography to ensure maximum readability.
* **Voice Assistant Integration:** We integrated the Web Speech API to provide audio feedback. Patients can tap large buttons to have their daily schedule or specific medication instructions read out loud to them. A microphone feature allows them to ask questions verbally instead of navigating complex menus.
* **Camera-Based Pill Verification:** We integrated react-webcam and an AI-powered verification service (OCR and color recognition) to allow patients to verify their medication before taking it. Patients hold a pill to their camera, and the application confirms if it matches their scheduled prescription, providing immediate audio and visual reassurance.
* **Simplified Navigation:** The interface relies on massive, highly tappable buttons, reduced text verbosity, and concise, direct instructions to eliminate confusion and reduce anxiety for non-tech-savvy users.

## Technical Details

For technical setup, installation instructions, and tech stack details, please see the respective folders:

* [Frontend README](./frontend/README.md) - Next.js Client
* [Backend README](./backend/README.md) - Express API & Services
