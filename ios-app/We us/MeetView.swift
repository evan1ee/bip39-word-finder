//
//  MeetView.swift
//  Weus
//
//  Created by Evan Lee on 7/15/25.
//

import SwiftUI

// MeetView.swift
struct MeetView: View {
    var body: some View {
        NavigationSplitView {
            Text("Meet content here")
        } detail: {
            Text("Meet detail view")
        }
    }
}
