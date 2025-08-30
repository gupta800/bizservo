import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { clientsStorage } = await import("~/lib/.server/clients.storage");
    
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    let clients;
    if (search) {
      clients = await clientsStorage.searchClients(search, limit);
    } else {
      clients = await clientsStorage.getClients(limit, offset);
    }

    const dashboardStats = await clientsStorage.getDashboardStats();

    return json({
      clients,
      dashboardStats,
      success: true
    });
  } catch (error) {
    console.error("Error loading clients:", error);
    return json({
      clients: [],
      dashboardStats: {
        totalClients: 0,
        activeProjects: 0,
        pendingDocuments: 0,
        recentUpdates: []
      },
      success: false,
      error: "Failed to load clients"
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    const { clientsStorage } = await import("~/lib/.server/clients.storage");

    switch (intent) {
      case "create_client": {
        const clientData = {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          company: formData.get("company") as string,
          status: (formData.get("status") as string) || "active",
          notes: formData.get("notes") as string,
          assignedTo: 1,
          metadata: {
            industry: formData.get("industry") as string,
            source: formData.get("source") as string,
            priority: (formData.get("priority") as string) || "medium",
            tags: []
          }
        };

        const client = await clientsStorage.createClient(clientData);
        return json({ success: true, client });
      }

      case "update_client_status": {
        const clientId = parseInt(formData.get("clientId") as string);
        const status = formData.get("status") as string;
        
        const client = await clientsStorage.updateClient(clientId, { status });
        return json({ success: true, client });
      }

      case "add_progress_update": {
        const updateData = {
          clientId: parseInt(formData.get("clientId") as string),
          projectId: formData.get("projectId") ? parseInt(formData.get("projectId") as string) : undefined,
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          updateType: formData.get("updateType") as string || "general",
          hoursWorked: parseInt(formData.get("hoursWorked") as string) || 0,
          createdBy: 1,
          metadata: {
            tags: [],
            priority: "medium"
          }
        };

        const update = await clientsStorage.addProgressUpdate(updateData);
        return json({ success: true, update });
      }

      default:
        return json({ 
          success: false, 
          error: "Invalid action" 
        }, { status: 400 });
    }
  } catch (error) {
    console.error("Client action error:", error);
    return json({ 
      success: false, 
      error: "Something went wrong. Please try again." 
    }, { status: 500 });
  }
}
