import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { onboardingStorage } = await import("~/lib/.server/onboarding.storage");
    
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const sessionId = searchParams.get("sessionId");
    const applicationId = searchParams.get("applicationId");

    if (applicationId) {
      const application = await onboardingStorage.getApplication(parseInt(applicationId));
      return json({ application, success: true });
    }

    if (sessionId) {
      const application = await onboardingStorage.getApplicationBySession(sessionId);
      return json({ application, success: true });
    }

    // Generate new session ID
    const newSessionId = onboardingStorage.generateSessionId();
    return json({ sessionId: newSessionId, success: true });

  } catch (error) {
    console.error("Error loading onboarding data:", error);
    return json({
      success: false,
      error: "Failed to load onboarding data",
      sessionId: 'fallback_' + Date.now()
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    const { onboardingStorage } = await import("~/lib/.server/onboarding.storage");

    switch (intent) {
      case "start_onboarding": {
        const sessionId = formData.get("sessionId") as string;
        const application = await onboardingStorage.createApplication(sessionId);
        return json({ success: true, applicationId: application.id });
      }

      case "save_onboarding_step": {
        const applicationId = parseInt(formData.get("applicationId") as string);
        const stepNumber = parseInt(formData.get("stepNumber") as string);
        const stepDataStr = formData.get("stepData") as string;
        
        try {
          const stepData = JSON.parse(stepDataStr);
          
          // Auto-save first
          await onboardingStorage.autoSave(applicationId, stepNumber, stepData);
          
          // Then validate and save
          const updatedApplication = await onboardingStorage.updateStep(applicationId, stepNumber, stepData);
          
          return json({ 
            success: true, 
            application: updatedApplication,
            message: "Step saved successfully!"
          });
        } catch (validationError: any) {
          console.error("Validation error:", validationError);
          return json({ 
            success: false, 
            error: validationError.message || "Validation failed",
            validationErrors: validationError.errors || {}
          }, { status: 400 });
        }
      }

      case "auto_save_onboarding": {
        const applicationId = parseInt(formData.get("applicationId") as string);
        const stepNumber = parseInt(formData.get("stepNumber") as string);
        const formDataStr = formData.get("formData") as string;
        
        try {
          const formDataObj = JSON.parse(formDataStr);
          await onboardingStorage.autoSave(applicationId, stepNumber, formDataObj);
          
          return json({ success: true, message: "Auto-saved" });
        } catch (error) {
          console.error("Auto-save error:", error);
          return json({ success: false, error: "Auto-save failed" }, { status: 500 });
        }
      }

      default:
        return json({ 
          success: false, 
          error: "Invalid action" 
        }, { status: 400 });
    }
  } catch (error) {
    console.error("Onboarding action error:", error);
    return json({ 
      success: false, 
      error: "Something went wrong. Please try again." 
    }, { status: 500 });
  }
}
