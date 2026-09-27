#include <iostream>
#include <vector>
#include <map>
#include <climits>
#include <algorithm>

using namespace std;

struct Edge {
    int to;
    int weight;
};

class Graph {
private:
    int V;
    vector<string> nodeNames;
    map<string, int> nodeIndex;
    vector<vector<Edge>> adj;

public:
    Graph(int vertices) {
        V = vertices;
        adj.resize(V);
        nodeNames.resize(V);
    }


    void addNode(int index, string name) {
        nodeNames[index] = name;
        nodeIndex[name] = index;
    }

  
    void addEdge(string from, string to, int weight) {

        int u = nodeIndex[from];
        int v = nodeIndex[to];

        adj[u].push_back({v, weight});
        adj[v].push_back({u, weight});
    }

   
    void dijkstra(string start, string end) {

        int startId = nodeIndex[start];
        int endId = nodeIndex[end];

        vector<int> dist(V, INT_MAX);
        vector<int> prev(V, -1);
        vector<bool> visited(V, false);

        dist[startId] = 0;

        for (int i = 0; i < V; i++) {

            int u = -1;
            int best = INT_MAX;

            for (int j = 0; j < V; j++) {

                if (!visited[j] && dist[j] < best) {
                    best = dist[j];
                    u = j;
                }
            }

            if (u == -1)
                break;

            visited[u] = true;

            for (auto edge : adj[u]) {

                int alt = dist[u] + edge.weight;

                if (!visited[edge.to] && alt < dist[edge.to]) {

                    dist[edge.to] = alt;
                    prev[edge.to] = u;
                }
            }
        }

        cout << "\nDistance Table\n";
        cout << "------------------------\n";

        for (int i = 0; i < V; i++) {

            cout << nodeNames[i] << " : ";

            if (dist[i] == INT_MAX)
                cout << "INF";
            else
                cout << dist[i];

            cout << endl;
        }

        if (dist[endId] == INT_MAX) {
            cout << "\nNo Path Found\n";
            return;
        }

        vector<int> path;

        int cur = endId;

        while (cur != -1) {
            path.push_back(cur);
            cur = prev[cur];
        }

        reverse(path.begin(), path.end());

        cout << "\nShortest Path : ";

        for (int i = 0; i < path.size(); i++) {

            cout << nodeNames[path[i]];

            if (i != path.size() - 1)
                cout << " -> ";
        }

        cout << "\nTotal Distance : " << dist[endId] << endl;
    }
};

int main() {

    int V;

    cout << "=========================================\n";
    cout << "      PathPilot Shortest Path Finder\n";
    cout << "=========================================\n\n";

    cout << "Enter Number of Nodes : ";
    cin >> V;

    Graph g(V);

    cout << "\nEnter Names of Nodes\n";

    for (int i = 0; i < V; i++) {

        string name;

        cout << "Node " << i + 1 << " : ";
        cin >> name;

        g.addNode(i, name);
    }

    int E;

    cout << "\nEnter Number of Edges : ";
    cin >> E;

    cout << "\nEnter Edge Details\n";
    cout << "(Source Destination Weight)\n\n";

    for (int i = 0; i < E; i++) {

        string from, to;
        int weight;

        cin >> from >> to >> weight;

        g.addEdge(from, to, weight);
    }

    string start, end;

    cout << "\nEnter Start Node : ";
    cin >> start;

    cout << "Enter End Node : ";
    cin >> end;

    g.dijkstra(start, end);

    return 0;
}
